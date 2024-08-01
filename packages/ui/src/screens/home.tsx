import TopBarLayout from "@/layouts/topbar";
import { useNavigate } from "react-router-dom";

export default function HomeScreen() {
const navigate = useNavigate()

  return (
    <TopBarLayout>
        <div className="flex gap-2 justify-center">
          <button className="btn" onClick={() => navigate("/amount")}>New Tx</button>
          <button className="btn" onClick={() => navigate("/activity")}>Last Txs</button>
        </div>
    </TopBarLayout>
  );
}
