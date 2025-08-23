
import TopBar from "./TopBar";

function Layout({ topBarWidget, pageContext, children }) {
  const title = "Construction Work App"

  return (
    <div style={{ backgroundColor: '#d9ead3', minHeight: '100vh' }}>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" href="/imgs/Logo_mini.svg" />
      {/* <link rel="stylesheet" href="/styles.css" /> */}
      <title>{ title }</title>

      <TopBar pageContext={pageContext} widget={topBarWidget}/>

      <div className="page-container">
        {children}
      </div>
    </div>
  );

}

export default Layout;
