import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resolveWorkspaceRawNoAuthFromId } from '@/lib/workspace';

async function GET(request: NextRequest) {
    const session = await auth();
    if (!session) {
        return NextResponse.redirect('/login');
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

    const result = await resolveWorkspaceRawNoAuthFromId(
        session.user.id,
        session.user.role,
        workspaceId
    );
    if (result instanceof NextResponse) {
        return result;
    }

    try {
        const result = await prisma.heartMeasurement.findMany({
            where: { workspaceId },
        });
        const header = [
            'Id',
            'SignalId',
            'DeviceId',
            'HeartRate',
            'Afib',
            'SamplingFrequency',
            'Timestamp',
            'Modified',
            'TrailsId',
            'Signal',
        ];

        const csvContent = [
            header.join(','),
            ...result.map(
                (e) =>
                    `${e.id},${e.signalId},${e.deviceId},${e.heartRate},${e.afib},${e.samplingFrequency},${e.timestamp.toISOString()},${e.modified.toISOString()},${e.trailsId},"${e.signal}"`
            ),
        ].join('\n');

        return new Response(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition':
                    'attachment; filename="ecgs-export.csv"',
            },
        });
    } catch (error) {
        console.error(error);
        return new Response('Internal Server Error', { status: 500 });
    }
}

export { GET };
