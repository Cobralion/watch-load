import { WITHINGS_HEART_URL } from '@/lib/withings/api-urls';
import { HeartGetError, HeartListError } from '@/types/errors';

export type ECGDictionary = Record<number, WithingsHeartGetBody>;

export async function getECGs(
    access_token: string,
    signalIds: number[]
): Promise<ECGDictionary> {
    const fetchSignal = async (
        signalId: number
    ): Promise<[number, WithingsHeartGetBody]> => {
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

            return [signalId, payload.body as WithingsHeartGetBody];
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            throw new HeartGetError(`Signal ${signalId} failed: ${message}`);
        }
    };

    const results = await Promise.all(signalIds.map((id) => fetchSignal(id)));
    return Object.fromEntries(results);
}

export async function listHeart(
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
