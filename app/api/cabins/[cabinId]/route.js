import { getBookedDatesByCabinId, getCabin } from "../../../_lib/data-service";

export async function GET(request, { params }) {
  const { cabinId } = params;
  try {
    const [cabin, bookderDates] = await Promise.all([
      getCabin(cabinId),
      getBookedDatesByCabinId(cabinId),
    ]);
    return Response.json({ cabin, bookderDates });
  } catch {
    return Response.json({ message: "Cabin not found" });
  }
}
// export async function POST(){}
