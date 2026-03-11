import { DataTable } from "@/components/dashboard/ecg-data-table";
import { columns, EcgTableData } from "@/components/dashboard/ecg-table-colums";

async function getData(): Promise<EcgTableData[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      trailsId: "trails-123",
      date: new Date(),
      data: "sample data",
    },
  ]
}

export default async function Page() {
  const data = await getData()

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <div className="flex flex-col gap-6 pt-6 m-4">
       <DataTable columns={columns} data={data} />
      </div>
    </>
  );
}
