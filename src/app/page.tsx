import { Panel } from "@/components/hud/Panel";
import { NetworkCore } from "@/components/NetworkCore";
import { ClockDate } from "@/components/ClockDate";
import { SystemStatus } from "@/components/SystemStatus";
import { CountdownPanel } from "@/components/CountdownPanel";
import { ScheduleFeed } from "@/components/ScheduleFeed";
import { ProjectStatus } from "@/components/ProjectStatus";
import { DepotOverview } from "@/components/DepotOverview";
import { EmailPanel } from "@/components/EmailPanel";
import { DailyBriefing } from "@/components/DailyBriefing";
import { ActiveAgentsPanel } from "@/components/ActiveAgentsPanel";
import { VoiceControl } from "@/components/VoiceControl";

export default function Home() {
  return (
    <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-4 border-b border-cyan-glow/10 pb-4">
        <div>
          <h1 className="font-display text-2xl font-black tracking-[0.15em] text-cyan-glow text-glow sm:text-3xl">
            JARVIS
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-glow/40">
            Personal Command Center
          </p>
        </div>
        <SystemStatus />
        <ClockDate />
      </header>

      <main className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="order-2 space-y-4 lg:order-1 lg:col-span-3">
          <CountdownPanel />
          <div className="h-64">
            <ScheduleFeed />
          </div>
          <div className="h-56">
            <ProjectStatus />
          </div>
        </div>

        <div className="order-1 flex flex-col items-center gap-4 lg:order-2 lg:col-span-6">
          <Panel
            glow
            className="relative flex aspect-square w-full max-w-xl items-center justify-center overflow-hidden"
          >
            <NetworkCore className="absolute inset-0" />
            <div className="relative z-10">
              <VoiceControl />
            </div>
          </Panel>
          <div className="h-64 w-full max-w-xl">
            <ActiveAgentsPanel />
          </div>
        </div>

        <div className="order-3 space-y-4 lg:col-span-3">
          <div className="h-56">
            <DepotOverview />
          </div>
          <div className="h-56">
            <EmailPanel />
          </div>
          <div className="h-56">
            <DailyBriefing />
          </div>
        </div>
      </main>

      <footer className="mt-6 pb-4 text-center text-[9px] uppercase tracking-[0.3em] text-cyan-glow/20">
        Jarvis Command Center · Q2
      </footer>
    </div>
  );
}
