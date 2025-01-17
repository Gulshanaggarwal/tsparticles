import { ClickMode } from "tsparticles-engine";
import type { ISourceOptions } from "tsparticles-engine";

export const options: ISourceOptions = {
    fpsLimit: 40,
    particles: {
        number: {
            value: 80,
            density: {
                enable: true,
                area: 800,
            },
        },
        color: {
            value: ["#fdcf58", "#757676", "#f27d0c", "#800909", "#f07f13"],
        },
        opacity: {
            value: { min: 0.1, max: 0.5 },
        },
        size: {
            value: { min: 1, max: 3 },
        },
        move: {
            enable: true,
            speed: 6,
            random: false,
        },
    },
    interactivity: {
        detectsOn: "window",
        events: {
            onClick: {
                enable: true,
                mode: ClickMode.push,
            },
            resize: true,
        },
    },
    background: {
        image: "radial-gradient(#4a0000, #000)",
    },
};
