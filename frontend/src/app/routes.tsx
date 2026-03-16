import { createBrowserRouter } from "react-router-dom";
import { MainLayout } from "./components/main-layout";
import { Dashboard } from "./pages/dashboard";
import { CodeReviewer } from "./pages/code-reviewer";
import { ScriptGenerator } from "./pages/script-generator";
import { GrammarChecker } from "./pages/grammar-checker";
import { DataAnalyst } from "./pages/data-analyst";
import { WatermarkRemover } from "./pages/watermark-remover";
import { ResumeBuilder } from "./pages/resume-builder";
import { WebScraper } from "./pages/web-scraper";
import { Settings } from "./pages/settings";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { HistoryPage } from "./pages/history-page";
import NotFoundPage from "./pages/not-found";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/register",
    Component: RegisterPage,
  },
  {
    path: "/",
    Component: ProtectedRoute,
    children: [
      {
        path: "/",
        Component: MainLayout,
        children: [
          { index: true, Component: Dashboard },
          { path: "code-reviewer", Component: CodeReviewer },
          { path: "script-generator", Component: ScriptGenerator },
          { path: "grammar-checker", Component: GrammarChecker },
          { path: "data-analyst", Component: DataAnalyst },
          { path: "watermark-remover", Component: WatermarkRemover },
          { path: "resume-builder", Component: ResumeBuilder },
          { path: "web-scraper", Component: WebScraper },
          { path: "history/:model/:id?", Component: HistoryPage },
          { path: "settings", Component: Settings },
        ],
      },
    ],
  },
  {
    path: "*",
    Component: NotFoundPage,
  },
]);
