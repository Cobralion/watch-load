import { WITHINGS_HEART_URL } from '@/lib/withings/api-urls';
import { HeartListError, SyncHeartError } from '@/types/errors';
import { getAccessToken } from '@/lib/helper';
import { prisma } from '@/lib/prisma';
import { HeartMeasurementCreateManyInput } from '@/generated/prisma/models/HeartMeasurement';

// Helper to chunk arrays for batch processing
const chunkArray = <T>(arr: T[], size: number): T[][] =>
    Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
        arr.slice(i * size, i * size + size)
    );

export async function syncHeartData(userId: string): Promise<void> {
    const accessToken = await getAccessToken(userId);
    if (!accessToken) {
        console.warn('No access token available for user:', userId);
        return;
    }

    try {
        const queryResult = await prisma.withingsDevice.findFirst({
            where: { user_id: userId },
            select: { last_sync: true },
        });

        if (!queryResult) return;

        const listedHeartData = await listHeart(
            accessToken,
            queryResult.last_sync,
            new Date()
        );

        if (listedHeartData.length === 0) return;

        const validItemsWithEcg = listedHeartData.filter(
            (item) => item.ecg?.signalid
        );
        const signalIds = validItemsWithEcg.map((item) => item.ecg.signalid);

        const ecgData = await getECGs(accessToken, signalIds);

        const afib = (e?: number) => {
            switch (e) {
                case 0:
                    return 'NEGATIVE';
                case 1:
                    return 'POSITIVE';
                case 2:
                    return 'INCONCLUSIVE';
                default:
                    return 'UNKNOWN';
            }
        };

        const ecgMap = new Map(
            ecgData.map((item) => [
                item.signalId,
                {
                    sampling_frequency: item.body.sampling_frequency,
                    signal: item.body.signal,
                },
            ])
        );

        const combinedData = listedHeartData.map(
            (item): HeartMeasurementCreateManyInput => {
                const signalId = item.ecg?.signalid;
                const ecg = signalId ? ecgMap.get(signalId) : undefined;
                if (!ecg) {
                    throw new SyncHeartError(
                        'Signal ID missing or ECG data not found for signal ID: ' +
                            signalId
                    );
                }

                return {
                    signal_id: signalId,
                    device_id: item.deviceid,
                    heart_rate: item.heart_rate,
                    afib: afib(item.ecg?.afib),
                    modified: new Date(item.modified * 1000),
                    timestamp: new Date(item.timestamp * 1000),
                    sampling_frequency: ecg?.sampling_frequency ?? 0,
                    signal: ecg?.signal ?? [],
                };
            }
        );

        const batches = chunkArray(combinedData, 100);
        for (const batch of batches) {
            await prisma.heartMeasurement.createMany({
                data: batch,
                skipDuplicates: true, // Crucial for overlapping syncs
            });
        }
    } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        throw new SyncHeartError(`Sync failed for user ${userId}: ${message}`);
    }
}

async function getECGs(
    access_token: string,
    signalIds: number[]
): Promise<SignalIdWithBody[]> {
    const fetchSignal = async (
        signalId: number
    ): Promise<SignalIdWithBody | null> => {
        try {
            const response = await fetch(WITHINGS_HEART_URL, {
                method: 'POST',
                headers: { Authorization: `Bearer ${access_token}` },
                body: new URLSearchParams({
                    action: 'get',
                    signalid: signalId.toString(),
                }),
            });

            const payload = await response.json().catch(() => ({}));

            if (!response.ok || payload.status !== 0 || !payload.body) {
                throw new Error(`Status ${payload.status || response.status}`);
            }

            return { signalId, body: payload.body as WithingsHeartGetBody };
        } catch (err) {
            // Log the error but return null so we don't fail the whole sync
            console.error(`Failed to fetch ECG ${signalId}:`, err);
            return null;
        }
    };

    const results: SignalIdWithBody[] = [];

    // Process in sequential batches of 10 to avoid Withings rate limits
    const batches = chunkArray(signalIds, 10);
    for (const batch of batches) {
        const batchResults = await Promise.all(
            batch.map((id) => fetchSignal(id))
        );

        // Filter out any nulls from failed fetches
        results.push(
            ...batchResults.filter(
                (res): res is SignalIdWithBody => res !== null
            )
        );
    }

    return results;
}

async function listHeart(
    access_token: string,
    startDate?: Date,
    endDate?: Date
): Promise<WithingsHeartListSeries[]> {
    let offset: number | undefined = undefined;
    const seriesList: WithingsHeartListSeries[] = [];

    while (true) {
        const data: WithingsHeartListBody = await fetchHeartList(
            access_token,
            offset,
            startDate,
            endDate
        );

        seriesList.push(...(data.series || []));

        if (!data.more || data.offset === undefined) break;
        offset = data.offset;
    }

    return seriesList;
}

async function fetchHeartList(
    access_token: string,
    offset?: number,
    startDate?: Date,
    endDate?: Date
): Promise<WithingsHeartListBody> {
    const params: Record<string, string> = { action: 'list' };

    if (startDate)
        params.startdate = Math.floor(startDate.getTime() / 1000).toString();
    if (endDate)
        params.enddate = Math.floor(endDate.getTime() / 1000).toString();
    if (offset !== undefined) params.offset = offset.toString();

    try {
        const response = await fetch(WITHINGS_HEART_URL, {
            method: 'POST',
            headers: { Authorization: `Bearer ${access_token}` },
            body: new URLSearchParams(params),
        });

        const payload = await response.json().catch(() => ({}));

        if (!response.ok || payload.status !== 0) {
            throw new Error(
                `API Error: ${payload.error || response.statusText}`
            );
        }

        return payload.body as WithingsHeartListBody;
    } catch (err) {
        throw new HeartListError(
            err instanceof Error ? err.message : 'Unknown List Error'
        );
    }
}

export type SignalIdWithBody = { signalId: number; body: WithingsHeartGetBody };

type WithingsHeartGetBody = {
    signal: number[];
    sampling_frequency: number;
    wearposition: number;
    model: number;
    heart_rate: number;
};

type WithingsHeartListBody = {
    series: WithingsHeartListSeries[];
    more: boolean;
    offset: number;
};

type WithingsHeartListSeries = {
    deviceid: string;
    model: number;
    ecg: WithingsHeartListECG;
    bloodpressure: WithingsHeartListBloodpressure;
    stetho: WithingsHeartListStetho;
    heart_rate: number;
    modified: number;
    timestamp: number;
};

type WithingsHeartListECG = {
    signalid: number;
    afib: number;
};

type WithingsHeartListBloodpressure = {
    diastole: number;
    systole: number;
};

type WithingsHeartListStetho = {
    signalid: number;
    vhd: number;
};
