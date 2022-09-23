import type {
    IContainerPlugin,
    ICoordinates,
    IDelta,
    IOptions,
    RecursivePartial,
    SingleOrMultiple,
} from "tsparticles-engine";
import { arrayRandomIndex, executeOnSingleOrMultiple, itemFromArray } from "tsparticles-engine";
import { Emitter } from "./Options/Classes/Emitter";
import { EmitterClickMode } from "./Enums/EmitterClickMode";
import type { EmitterContainer } from "./EmitterContainer";
import { EmitterInstance } from "./EmitterInstance";
import type { EmittersEngine } from "./EmittersEngine";
import type { IEmitter } from "./Options/Interfaces/IEmitter";
import type { IEmitterModeOptions } from "./Options/Interfaces/IEmitterModeOptions";
import type { IEmitterOptions } from "./Options/Interfaces/IEmitterOptions";

/**
 * @category Emitters Plugin
 */
export class Emitters implements IContainerPlugin {
    array: EmitterInstance[];
    emitters: SingleOrMultiple<Emitter>;
    interactivityEmitters: IEmitterModeOptions;

    private readonly _engine;

    constructor(engine: EmittersEngine, private readonly container: EmitterContainer) {
        this._engine = engine;
        this.array = [];
        this.emitters = [];
        this.interactivityEmitters = {
            random: {
                count: 1,
                enable: false,
            },
            value: [],
        };

        container.getEmitter = (idxOrName?: number | string): EmitterInstance | undefined =>
            idxOrName === undefined || typeof idxOrName === "number"
                ? this.array[idxOrName || 0]
                : this.array.find((t) => t.name === idxOrName);

        container.addEmitter = (options: RecursivePartial<IEmitter>, position?: ICoordinates): EmitterInstance =>
            this.addEmitter(options, position);

        container.removeEmitter = (idxOrName?: number | string): void => {
            const emitter = container.getEmitter(idxOrName);

            if (emitter) {
                this.removeEmitter(emitter);
            }
        };

        container.playEmitter = (idxOrName?: number | string): void => {
            const emitter = container.getEmitter(idxOrName);

            if (emitter) {
                emitter.externalPlay();
            }
        };

        container.pauseEmitter = (idxOrName?: number | string): void => {
            const emitter = container.getEmitter(idxOrName);

            if (emitter) {
                emitter.externalPause();
            }
        };
    }

    addEmitter(options: RecursivePartial<IEmitter>, position?: ICoordinates): EmitterInstance {
        const emitterOptions = new Emitter();

        emitterOptions.load(options);

        const emitter = new EmitterInstance(this._engine, this, this.container, emitterOptions, position);

        this.array.push(emitter);

        return emitter;
    }

    handleClickMode(mode: string): void {
        const emitterOptions = this.emitters,
            modeEmitters = this.interactivityEmitters;

        if (mode === EmitterClickMode.emitter) {
            let emittersModeOptions: SingleOrMultiple<IEmitter> | undefined;

            if (modeEmitters && modeEmitters.value instanceof Array) {
                if (modeEmitters.value.length > 0 && modeEmitters.random.enable) {
                    emittersModeOptions = [];
                    const usedIndexes: number[] = [];

                    for (let i = 0; i < modeEmitters.random.count; i++) {
                        const idx = arrayRandomIndex(modeEmitters.value);

                        if (usedIndexes.includes(idx) && usedIndexes.length < modeEmitters.value.length) {
                            i--;
                            continue;
                        }

                        usedIndexes.push(idx);
                        emittersModeOptions.push(itemFromArray(modeEmitters.value, idx));
                    }
                } else {
                    emittersModeOptions = modeEmitters.value;
                }
            } else {
                emittersModeOptions = modeEmitters?.value;
            }

            const emittersOptions = emittersModeOptions ?? emitterOptions,
                ePosition = this.container.interactivity.mouse.clickPosition;

            executeOnSingleOrMultiple(emittersOptions, (emitter) => {
                this.addEmitter(emitter, ePosition);
            });
        }
    }

    init(options?: RecursivePartial<IOptions & IEmitterOptions>): void {
        if (!options) {
            return;
        }

        this.emitters = executeOnSingleOrMultiple(options.emitters, (emitter) => {
            const tmp = new Emitter();

            tmp.load(emitter);

            return tmp;
        });

        const interactivityEmitters = options.interactivity?.modes?.emitters;

        if (interactivityEmitters) {
            if (interactivityEmitters instanceof Array) {
                this.interactivityEmitters = {
                    random: {
                        count: 1,
                        enable: true,
                    },
                    value: interactivityEmitters.map((s) => {
                        const tmp = new Emitter();

                        tmp.load(s);

                        return tmp;
                    }),
                };
            } else {
                const emitterMode = interactivityEmitters as IEmitterModeOptions;

                if (emitterMode.value !== undefined) {
                    if (emitterMode.value instanceof Array) {
                        this.interactivityEmitters = {
                            random: {
                                count: this.interactivityEmitters.random.count ?? 1,
                                enable: this.interactivityEmitters.random.enable ?? false,
                            },
                            value: emitterMode.value.map((s) => {
                                const tmp = new Emitter();

                                tmp.load(s);

                                return tmp;
                            }),
                        };
                    } else {
                        const tmp = new Emitter();

                        tmp.load(emitterMode.value);

                        this.interactivityEmitters = {
                            random: {
                                count: this.interactivityEmitters.random.count ?? 1,
                                enable: this.interactivityEmitters.random.enable ?? false,
                            },
                            value: tmp,
                        };
                    }
                } else {
                    const tmp = new Emitter();

                    tmp.load(interactivityEmitters as IEmitter);

                    this.interactivityEmitters = {
                        random: {
                            count: this.interactivityEmitters.random.count ?? 1,
                            enable: this.interactivityEmitters.random.enable ?? false,
                        },
                        value: tmp,
                    };
                }
            }
        }

        if (this.emitters instanceof Array) {
            for (const emitterOptions of this.emitters) {
                this.addEmitter(emitterOptions);
            }
        } else {
            this.addEmitter(this.emitters);
        }
    }

    pause(): void {
        for (const emitter of this.array) {
            emitter.pause();
        }
    }

    play(): void {
        for (const emitter of this.array) {
            emitter.play();
        }
    }

    removeEmitter(emitter: EmitterInstance): void {
        const index = this.array.indexOf(emitter);

        if (index >= 0) {
            this.array.splice(index, 1);
        }
    }

    resize(): void {
        for (const emitter of this.array) {
            emitter.resize();
        }
    }

    stop(): void {
        this.array = [];
    }

    update(delta: IDelta): void {
        for (const emitter of this.array) {
            emitter.update(delta);
        }
    }
}
