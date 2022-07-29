import {
    Circle,
    DivMode,
    DivType,
    ExternalInteractorBase,
    HoverMode,
    Rectangle,
    Vector,
    calculateBounds,
    circleBounce,
    circleBounceDataFromParticle,
    divModeExecute,
    isDivModeEnabled,
    isInArray,
    mouseMoveEvent,
    rectBounce,
} from "tsparticles-engine";
import type {
    Container, DivEvent, ICoordinates, Particle,
    Range
} from "tsparticles-engine";

export class Bouncer extends ExternalInteractorBase {
    constructor(container: Container) {
        super(container);
    }

    clear(): void {
        // do nothing
    }

    init(): void {
        // do nothing
    }

    async interact(): Promise<void> {
        /*const container = this.container,
            options = container.actualOptions,
            events = options.interactivity.events,
            mouseMoveStatus = container.interactivity.status === mouseMoveEvent,
            hoverEnabled = events.onHover.enable,
            hoverMode = events.onHover.mode,
            divs = events.onDiv;

        if (mouseMoveStatus && hoverEnabled && isInArray(HoverMode.bounce, hoverMode)) {
            this.processMouseBounce();
        } else {
            divModeExecute(DivMode.bounce, divs, (selector, div): void => this.singleSelectorBounce(selector, div));
        }*/
    }

    isEnabled(particle?: Particle): boolean {
        const container = this.container,
            options = container.actualOptions,
            mouse = container.interactivity.mouse,
            events = (particle?.interactivity ?? options.interactivity).events,
            divs = events.onDiv;

        return (
            (mouse.position && events.onHover.enable && isInArray(HoverMode.bounce, events.onHover.mode)) ||
            isDivModeEnabled(DivMode.bounce, divs)
        );
    }

    async particleInteract(particle: Particle): Promise<void> {
        const container = this.container,
            options = container.actualOptions,
            events = options.interactivity.events,
            mouseMoveStatus = container.interactivity.status === mouseMoveEvent,
            hoverEnabled = events.onHover.enable,
            hoverMode = events.onHover.mode,
            divs = events.onDiv;

        if (mouseMoveStatus && hoverEnabled && isInArray(HoverMode.bounce, hoverMode)) {
            this.processMouseBounce(particle);
        } else {
            divModeExecute(DivMode.bounce, divs, (selector, div): void => this.singleSelectorBounce(selector, div, particle));
        }
    }

    reset(): void {
        // do nothing
    }

    private processBounce(position: ICoordinates, radius: number, area: Range): void {
        const query = this.container.particles.quadTree.query(area, (p) => this.isEnabled(p));

        for (const particle of query) {
            if (area instanceof Circle) {
                circleBounce(circleBounceDataFromParticle(particle), {
                    position,
                    radius,
                    mass: (radius ** 2 * Math.PI) / 2,
                    velocity: Vector.origin,
                    factor: Vector.origin,
                });
            } else if (area instanceof Rectangle) {
                rectBounce(particle, calculateBounds(position, radius));
            }
        }
    }

    private processMouseBounce(particle?: Particle): void {
        const container = this.container,
            pxRatio = container.retina.pixelRatio,
            tolerance = 10 * pxRatio,
            mousePos = container.interactivity.mouse.position,
            radius = container.retina.bounceModeDistance;

        if (mousePos) {
            if (particle) {
                circleBounce(circleBounceDataFromParticle(particle), {
                    position: mousePos,
                    radius,
                    mass: (radius ** 2 * Math.PI) / 2,
                    velocity: Vector.origin,
                    factor: Vector.origin,
                });
            } else {
                this.processBounce(mousePos, radius, new Circle(mousePos.x, mousePos.y, radius + tolerance));
            }
        }
    }

    private singleSelectorBounce(selector: string, div: DivEvent, particle?: Particle): void {
        const container = this.container,
            query = document.querySelectorAll(selector);

        if (!query.length) {
            return;
        }

        query.forEach((item) => {
            const elem = item as HTMLElement,
                pxRatio = container.retina.pixelRatio,
                pos = {
                    x: (elem.offsetLeft + elem.offsetWidth / 2) * pxRatio,
                    y: (elem.offsetTop + elem.offsetHeight / 2) * pxRatio,
                },
                radius = (elem.offsetWidth / 2) * pxRatio,
                tolerance = 10 * pxRatio;


            if (particle) {
                switch (div.type) {
                    case DivType.circle:
                        circleBounce(circleBounceDataFromParticle(particle), {
                            position: pos,
                            radius,
                            mass: (radius ** 2 * Math.PI) / 2,
                            velocity: Vector.origin,
                            factor: Vector.origin,
                        });
                        break;
                    case DivType.rectangle:
                        rectBounce(particle, calculateBounds(pos, radius));
                        break;
                }
            } else {
                const area =
                    div.type === DivType.circle
                        ? new Circle(pos.x, pos.y, radius + tolerance)
                        : new Rectangle(
                            elem.offsetLeft * pxRatio - tolerance,
                            elem.offsetTop * pxRatio - tolerance,
                            elem.offsetWidth * pxRatio + tolerance * 2,
                            elem.offsetHeight * pxRatio + tolerance * 2
                        );

                this.processBounce(pos, radius, area);
            }
        });
    }
}
