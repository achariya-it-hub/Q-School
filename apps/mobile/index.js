/**
 * Q-School entry wrapper — keeps the bundler entry inside apps/mobile.
 * The realpath of `expo-router/entry` lives in the pnpm store at the repo root,
 * which breaks Metro's workspace-root resolution during release builds.
 */
import "./node_modules/expo-router/entry";
