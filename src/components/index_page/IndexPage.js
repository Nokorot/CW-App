
import HomePageContainer from "./Home";
import LerpPageContainer from "./Lerp";
import StepsPC from "./Steps";
import Layout from "../Layout";

import { useState } from "react";

function IndexPage() {

  var initViewState = { type: 'steps' };
  const [viewState, setViewState] = useState(initViewState);

  const [ topBarWidget, setTopBarWidget] = useState(null);

  const pageContext = {
    'setTopBarWidget':  setTopBarWidget,
    'setViewState': setViewState,
  };

  var pgContainer = null;
  switch (viewState.type) {
    case 'home':
      pgContainer = (<HomePageContainer
        pageContext={pageContext}
      />);
      break;

    case 'lerp':
      pgContainer = (<LerpPageContainer
        pageContext={pageContext}
      />); break;
    case 'steps':
      pgContainer = (<StepsPC
        pageContext={pageContext}
      />); break;


    // case 'new':
    //   pgContainer = (<NewEntryForm
    //     pageContext={pageContext}
    //     onClose={() => setViewState({ type: 'list' })}
    //     onSuccess={(message) => setFlash(message)}
    //   />);
    default:
      return (<div> Invalid Page state "{viewState.type}" </div> );
  }

  return (<Layout
    pageContext={pageContext}
    topBarWidget={topBarWidget} /* flash={flash} */>
    { pgContainer }
  </Layout>);
}

export default IndexPage;
