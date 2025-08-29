
import {useSettings} from "../SettingsContext";
import MemBar from "./MemBar";
import TopBar from "./TopBar";


function Layout({
      topBarWidget,
      pageContext,
      showMemBar,
      children
  }) {

  const {settings } = useSettings();

  return (
    <>
      <TopBar pageContext={pageContext} widget={topBarWidget}/>

      {showMemBar && settings.memBarPosition === "top" && <MemBar />}

      <div className={`page-container ${showMemBar ? "has-membar-"  + settings.memBarPosition : ""}`}>
        {children}
      </div>

      {showMemBar && settings.memBarPosition === "bottom" && <MemBar />}
    </>
  );

}

export default Layout;
