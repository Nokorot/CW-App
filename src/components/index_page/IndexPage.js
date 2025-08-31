
import LerpPC from "./Lerp";
import StepsPC from "./Steps";
import Layout from "../Layout";

import { useState, useEffect } from "react";
import PythagorasPage from "./Pythagoras";
import CalculatorPage from "./Calc";
import SettingsPage from "./SettingPage";

import "../Page.css";
import {useTranslation} from "react-i18next";


function useViewStates() {
  const {t} = useTranslation();

  var viewStates = {
    calc: {
      type: 'calc',
      pgc: CalculatorPage,
      title: t("nav.calc"),
      topBarMenu: true,
      memBar: true,
    },
    lerp: {
      type: 'lerp',
      pgc: LerpPC,
      title: t("nav.lerp"),
      topBarMenu: true,
      memBar: true,
    },
    steps: {
      type: 'steps',
      pgc: StepsPC,
      title: t("nav.steps"),
      topBarMenu: true,
      memBar: true,
    },
    pyth: {
      type: 'pyth',
      pgc: PythagorasPage,
      title: t("nav.pyth"),
      topBarMenu: true,
      memBar: true,
    },

    settings: {
      type: 'settings',
      pgc: SettingsPage,
      title: t("nav.settings"),
      topBarMenu: true,
    },
  }

  return {viewStates};
}


export function usePersistentViewState() {
  const key = "indexpage-veiwstate";

  const {viewStates} = useViewStates();
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

  const {viewStates} = useViewStates();
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
        showMemBar={viewState.memBar}
        topBarWidget={topBarWidget} /* flash={flash} */
      >

      <viewState.pgc
            pageContext={pageContext}
      />
    </Layout>);
  } else {
    return (<div> Invalid Page state "{viewState.type}" </div> );
  }

}

export default IndexPage;
