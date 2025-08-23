
import HomePageContainer from "./Home";
import LerpPC from "./Lerp";
import StepsPC from "./Steps";
import Layout from "../Layout";

import { useState, useEffect } from "react";
import PythagorasPage from "./Pythagoras";

function IndexPage() {
  var viewStates = {};
  viewStates.home = {
    type: 'home',
    pgc: HomePageContainer,
    title: "Home"
  }
  viewStates.lerp = {
    type: 'lerp',
    pgc: LerpPC,
    title: "Distribute",
    topBarMenu: true,
  }
  viewStates.steps = {
    type: 'steps',
    pgc: StepsPC,
    title: "Multiples",
    topBarMenu: true,
  }
  viewStates.pythgas = {
    type: 'pythgas',
    pgc: PythagorasPage,
    title: "Diagonal",
    topBarMenu: true,
  }

  const initialView = viewStates.pythgas

  const [viewState, setViewState] = useState(initialView);
  const [topBarWidget, setTopBarWidget] = useState(null);

  const pageContext = {
    'setTopBarWidget':  setTopBarWidget,
    'setViewState': setViewState,
    'currentView': viewState,
    'viewStates': viewStates,
  };

  useEffect(() => {
    if (viewState.title) {
      pageContext.setTopBarWidget(
        <h2>{ viewState.title }</h2>
      );
    }
  }, [viewState]);

  if (viewState.pgc) {

    return (<Layout
      pageContext={pageContext}
      topBarWidget={topBarWidget} /* flash={flash} */>
      <viewState.pgc
            pageContext={pageContext}
      />
    </Layout>);
  } else {
    return (<div> Invalid Page state "{viewState.type}" </div> );
  }

}

export default IndexPage;
