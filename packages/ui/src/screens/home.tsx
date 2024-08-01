import Topbar from "@/components/layout/topbar";

export default function HomeScreen() {
  return (
    <div>
      <Topbar />
      <div className="py-10 px-4">
        <div className="flex gap-2 justify-center">
          <button className="btn">New Tx</button>
          <button className="btn">Last Txs</button>
        </div>
      </div>
    </div>
  );
}
