import Topbar from "@/components/layout/topbar";

export default function TopBarLayout(props: { children: React.ReactNode }) {
  return (
    <div>
      <Topbar />
      <div className="py-10 px-4">{props.children}</div>
    </div>
  );
}
