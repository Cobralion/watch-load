import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveWorkspaceRawNoAuthFromId } from '@/lib/workspace';
import { env } from '@/env';
import {
    buildEcgExportFilename,
    ECG_CSV_HEADERS,
    formatCsvRow,
    UTF8_BOM,
} from '@/lib/csv';

const EXPORT_BATCH_SIZE = 100;

type MeasurementRow = Awaited<ReturnType<typeof fetchMeasurementBatch>>[number];

async function fetchMeasurementBatch(
    workspaceId: string,
    cursor: string | undefined
) {
    return prisma.heartMeasurement.findMany({
        where: { workspaceId },
        include: { location: true },
        orderBy: { id: 'asc' },
        take: EXPORT_BATCH_SIZE,
        ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    });
}

function measurementToCsvRow(row: MeasurementRow): string {
    return formatCsvRow([
        row.id,
        row.signalId,
        row.deviceId,
        row.heartRate,
        row.afib,
        row.samplingFrequency,
        row.timestamp.toISOString(),
        row.modified.toISOString(),
        row.trialsId,
        row.location?.name ?? '',
        JSON.stringify(row.signal),
    ]);
}

async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect(new URL('/login', env.APP_URL));
    }

    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspace');
    if (!workspaceId) {
        return new Response('Bad Request', { status: 400 });
    }

    const format = searchParams.get('format');
    if (!format || format !== 'csv') {
        return new Response('Bad Request', { status: 400 });
    }

    const access = await resolveWorkspaceRawNoAuthFromId(
        session.user.id,
        session.user.role,
        workspaceId
    );
    if (access instanceof NextResponse) {
        return access;
    }

    const { workspace } = access;
    const filename = buildEcgExportFilename(workspace.slug);
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        async start(controller) {
            try {
                controller.enqueue(encoder.encode(UTF8_BOM));
                controller.enqueue(
                    encoder.encode(`${formatCsvRow([...ECG_CSV_HEADERS])}\n`)
                );

                let cursor: string | undefined;

                while (true) {
                    const batch = await fetchMeasurementBatch(
                        workspace.id,
                        cursor
                    );

                    if (batch.length === 0) {
                        break;
                    }

                    let chunk = '';
                    for (const row of batch) {
                        chunk += `${measurementToCsvRow(row)}\n`;
                    }
                    controller.enqueue(encoder.encode(chunk));

                    cursor = batch[batch.length - 1].id;

                    if (batch.length < EXPORT_BATCH_SIZE) {
                        break;
                    }
                }

                controller.close();
            } catch (error) {
                console.error(error);
                controller.error(error);
            }
        },
    });

    return new Response(stream, {
        status: 200,
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}

export { GET };
