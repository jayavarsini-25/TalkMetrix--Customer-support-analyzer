import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-16 md:pt-16 px-4 sm:px-6 pb-8 max-w-[1600px] mx-auto">
        {children}
      </main>
    </div>
  );
};

export default Layout;
