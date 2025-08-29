
import MemBar from "./MemBar";
import TopBar from "./TopBar";

function Layout({
      topBarWidget,
      pageContext,
      showMemBar,
      children
  }) {

  return (
    <>
      <TopBar pageContext={pageContext} widget={topBarWidget}/>
      {showMemBar && <MemBar />}

      <div className={`page-container ${showMemBar ? "has-membar" : ""}`}>
        {children}
      </div>
    </>
  );

}

export default Layout;
