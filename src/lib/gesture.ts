/**
 * Timing for the hero robot's pointing gesture.
 *
 * Shared between the 3D arm (which plays it) and the click handler (which holds
 * a navigation back until the robot has actually reached the thing you clicked),
 * so the two can never drift apart.
 */

/** Seconds to extend the arm to the target. */
export const REACH_IN = 1.15;
/** Seconds the robot holds the point once it arrives. */
export const HOLD = 1.2;
/** Seconds to lower the arm again. */
export const REACH_OUT = 0.95;
export const GESTURE = REACH_IN + HOLD + REACH_OUT;

/** Seconds the contact ripple takes to expand and fade. */
export const RIPPLE = 0.75;

/**
 * Beat between the robot touching the target and the section opening — long
 * enough for the ripple to register as the robot's press, short enough that the
 * navigation still feels like a response to it.
 */
export const OPEN_AFTER_CONTACT = 0.4;

/** How long a link click waits so the robot can press it first. */
export const NAV_DELAY_MS = (REACH_IN + OPEN_AFTER_CONTACT) * 1000;
