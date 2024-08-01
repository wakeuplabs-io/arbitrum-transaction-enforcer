import Topbar from "@/components/layout/topbar";

export default function TopBarLayout(props: { children: React.ReactNode }) {
  return (
    <div>
      <Topbar />
      <main className="py-10 px-4">{props.children}</main>
    </div>
  );
}
