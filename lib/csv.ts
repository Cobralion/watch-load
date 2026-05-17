export function escapeCsvField(
    value: string | number | boolean | null | undefined
): string {
    if (value === null || value === undefined) {
        return '';
    }

    const str = String(value);
    if (/[",\r\n]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
    }

    return str;
}

export function formatCsvRow(
    fields: (string | number | boolean | null | undefined)[]
): string {
    return fields.map(escapeCsvField).join(',');
}

export function buildEcgExportFilename(workspaceSlug: string): string {
    const safeSlug = workspaceSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '');
    const date = new Date().toISOString().slice(0, 10);
    return `ecgs-${safeSlug || 'workspace'}-${date}.csv`;
}

export const UTF8_BOM = '\uFEFF';

export const ECG_CSV_HEADERS = [
    'Id',
    'SignalId',
    'DeviceId',
    'HeartRate',
    'Afib',
    'SamplingFrequency',
    'Timestamp',
    'Modified',
    'TrialsId',
    'Location',
    'Signal',
] as const;
