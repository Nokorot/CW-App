
import HomePageContainer from "./Home";
import LerpPC from "./Lerp";
import StepsPC from "./Steps";
import Layout from "../Layout";

import { useState, useEffect } from "react";
import PythagorasPage from "./Pythagoras";
import CalculatorPage from "./Calc";
import SettingsPage from "./SettingPage";


var viewStates = {
  calc: {
    type: 'calc',
    pgc: CalculatorPage,
    title: "Calculator",
    topBarMenu: true,
  },
  lerp: {
    type: 'lerp',
    pgc: LerpPC,
    title: "Distribute",
    topBarMenu: true,
  },
  steps: {
    type: 'steps',
    pgc: StepsPC,
    title: "Multiples",
    topBarMenu: true,
  },
  pythgas: {
    type: 'pythgas',
    pgc: PythagorasPage,
    title: "Diagonal",
    topBarMenu: true,
  },

  settings: {
    type: 'settings',
    pgc: SettingsPage,
    title: "Settings",
    topBarMenu: true,
  },
  home: {
    type: 'home',
    pgc: HomePageContainer,
    title: "Home"
  },
}


export function usePersistentViewState() {
  const key = "indexpage-veiwstate";
  const initialValue = viewStates.calc;

  // load once from localStorage
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);

      return stored !== null ? viewStates[JSON.parse(stored)] : initialValue;
    } catch {
      return initialValue;
    }
  });

  // save whenever value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value.type));
    } catch {
      /* ignore quota errors */
    }
  }, [key, value]);

  return [value, setValue];
}





function IndexPage() {

  const initialView = viewStates.calc;

  const [viewState, setViewState] = usePersistentViewState(initialView);
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
