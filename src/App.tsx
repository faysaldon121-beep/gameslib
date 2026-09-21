import React from 'react';
import { Root, useSiteData } from 'react-static';
import { Router } from '@reach/router'; // <-- Import from @reach/router
import { GameDataProvider } from './context/GameDataContext';
import { Layout } from './components/Layout';
import { Game, Software } from './types';
import HomePage from './pages/index';
import AboutPage from './pages/about';
import GamePage from './pages/game';
import Categories from './pages/categories';
import SoftwarePage from "./pages/software"

function App() {
  const { games, searchIndex, softwares } = useSiteData<{ games: Game[]; softwares: Software; searchIndex: object }>();

  return (
    <Root>
      <GameDataProvider games={games} softwares={softwares} searchIndex={searchIndex}>
        <Layout>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Router>
              <HomePage path="/" />
              <AboutPage path="/about" />
              <GamePage path="/games/:slug" />
              <Categories path="/categories" />
              <SoftwarePage path="/softwares/:slug" />
            </Router>
          </React.Suspense>
        </Layout>
      </GameDataProvider>
    </Root>
  );
}

export default App;