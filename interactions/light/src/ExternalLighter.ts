import { ExternalInteractorBase, HoverMode, isInArray, rangeColorToRgb } from "tsparticles-engine";
import type { LightContainer } from "./Types";
import type { Particle } from "tsparticles-engine";
import { drawLight } from "./Utils";

export class ExternalLighter extends ExternalInteractorBase {
    constructor(container: LightContainer) {
        super(container);
    }

    clear(): void {
        // do nothing
    }

    init(): void {
        // do nothing
    }

    async interact(): Promise<void> {
        const container = this.container,
            options = container.actualOptions;

        if (options.interactivity.events.onHover.enable && container.interactivity.status === "mousemove") {
            const mousePos = container.interactivity.mouse.position;

            if (!mousePos) {
                return;
            }

            container.canvas.draw((ctx) => {
                drawLight(container, ctx, mousePos);
            });
        }
    }

    isEnabled(particle?: Particle): boolean {
        const container = this.container as LightContainer,
            mouse = container.interactivity.mouse,
            interactivity = particle?.interactivity ?? container.actualOptions.interactivity,
            events = interactivity.events;

        if (!(events.onHover.enable && mouse.position)) {
            return false;
        }

        const res = isInArray(HoverMode.light, events.onHover.mode);

        if (res) {
            const lightGradient = interactivity.modes.light.area.gradient;

            container.canvas.mouseLight = {
                start: rangeColorToRgb(lightGradient.start),
                stop: rangeColorToRgb(lightGradient.stop),
            };
        }

        return res;
    }

    async particleInteract(): Promise<void> {
        // do nothing
    }

    reset(): void {
        // do nothing
    }
}
