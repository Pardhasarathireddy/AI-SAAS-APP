import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { tools } from "../lib/tools";

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="mb-2">AI Tools Dashboard</h1>
        <p className="text-muted-foreground">
          Select a tool to get started with AI-powered automation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.path}
              className="group hover:shadow-lg transition-all duration-300 border-border/50 hover:border-border overflow-hidden"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div
                    className={`p-3 rounded-xl bg-gradient-to-br ${tool.gradient} mb-4`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <CardTitle className="group-hover:text-primary transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={tool.path}>
                  <Button className="w-full group/btn">
                    Open Tool
                    <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
