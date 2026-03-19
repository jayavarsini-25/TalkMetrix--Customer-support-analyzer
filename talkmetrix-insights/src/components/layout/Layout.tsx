import Navbar from "./Navbar";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen w-full bg-background">
      <Navbar />
      <main className="w-full pt-16 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mx-auto w-full max-w-[1440px]">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
