import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';
import ExcelJS from 'exceljs';
import { prisma } from '@/lib/prisma';

async function GET() {
    const session = await auth();
    if (!session) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('ECGs');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: 'signal ID', key: 'signal_id', width: 20 },
        { header: 'device ID', key: 'device_id', width: 20 },
        { header: 'heart rate', key: 'heart_rate', width: 10 },
        { header: 'atrial fibrillation ', key: 'afib', width: 10 },
        { header: 'created at', key: 'timestamp', width: 20 },
        { header: 'modified at', key: 'modified', width: 20 },
        { header: 'sampling frequency', key: 'sampling_frequency', width: 10 },
        { header: 'trails ID', key: 'trails_id', width: 10 },
        { header: 'Signal', key: 'signal', width: 10 },
    ];

    // TODO: Excel finds illegal symbols
    try {
        const result = await prisma.heartMeasurement.findMany();
        const rows = result.map((row) => {
            return {
                ...row,
                signal_id: row.signal_id.toString(),
                trails_id: row.trails_id ?? '0',
            };
        });

        worksheet.addRows(rows);
        const buffer = await workbook.xlsx.writeBuffer();
        return new NextResponse(buffer, {
            status: 200,
            headers: {
                'Content-Disposition': 'attachment; filename="ecg_data.xlsx"',
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            },
        });
    } catch (error) {
        console.error(error);
        return new NextResponse('Internal server error occurred,', {
            status: 500,
        });
    }
}

export { GET };
