/**
 * VSCode Theme Presets
 *
 * Popular VSCode themes adapted for Supabase Studio.
 */

import type { VSCodeThemePreset } from '../types'

/**
 * Dracula Theme
 * https://draculatheme.com/
 */
const dracula: VSCodeThemePreset = {
  id: 'dracula',
  name: 'Dracula',
  preview: {
    background: '#282a36',
    foreground: '#f8f8f2',
    accent: '#bd93f9',
    surface: '#21222c',
  },
  theme: {
    name: 'Dracula',
    type: 'dark',
    colors: {
      'editor.background': '#282a36',
      'editor.foreground': '#f8f8f2',
      'sideBar.background': '#21222c',
      'sideBar.foreground': '#f8f8f2',
      'activityBar.background': '#343746',
      'activityBar.foreground': '#f8f8f2',
      'activityBarBadge.background': '#bd93f9',
      'panel.background': '#282a36',
      'panel.border': '#44475a',
      'button.background': '#bd93f9',
      'button.foreground': '#f8f8f2',
      'input.background': '#282a36',
      'input.foreground': '#f8f8f2',
      'input.border': '#44475a',
      'list.activeSelectionBackground': '#44475a',
      'list.hoverBackground': '#343746',
      focusBorder: '#bd93f9',
      'textLink.foreground': '#8be9fd',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#6272a4' } },
      { scope: 'string', settings: { foreground: '#f1fa8c' } },
      { scope: 'constant.numeric', settings: { foreground: '#bd93f9' } },
      { scope: 'keyword', settings: { foreground: '#ff79c6' } },
      { scope: 'variable', settings: { foreground: '#f8f8f2' } },
      { scope: 'entity.name.function', settings: { foreground: '#50fa7b' } },
      { scope: 'entity.name.type', settings: { foreground: '#8be9fd' } },
      { scope: 'storage.type', settings: { foreground: '#ff79c6' } },
    ],
  },
}

/**
 * One Dark Pro Theme
 * https://marketplace.visualstudio.com/items?itemName=zhuangtongfa.Material-theme
 */
const oneDarkPro: VSCodeThemePreset = {
  id: 'one-dark-pro',
  name: 'One Dark Pro',
  preview: {
    background: '#282c34',
    foreground: '#abb2bf',
    accent: '#61afef',
    surface: '#21252b',
  },
  theme: {
    name: 'One Dark Pro',
    type: 'dark',
    colors: {
      'editor.background': '#282c34',
      'editor.foreground': '#abb2bf',
      'sideBar.background': '#21252b',
      'sideBar.foreground': '#abb2bf',
      'activityBar.background': '#282c34',
      'activityBar.foreground': '#d7dae0',
      'activityBarBadge.background': '#61afef',
      'panel.background': '#21252b',
      'panel.border': '#3e4452',
      'button.background': '#61afef',
      'button.foreground': '#ffffff',
      'input.background': '#1d1f23',
      'input.foreground': '#abb2bf',
      'input.border': '#3e4452',
      'list.activeSelectionBackground': '#2c313a',
      'list.hoverBackground': '#2c313a',
      focusBorder: '#61afef',
      'textLink.foreground': '#61afef',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#5c6370', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#98c379' } },
      { scope: 'constant.numeric', settings: { foreground: '#d19a66' } },
      { scope: 'keyword', settings: { foreground: '#c678dd' } },
      { scope: 'variable', settings: { foreground: '#e06c75' } },
      { scope: 'entity.name.function', settings: { foreground: '#61afef' } },
      { scope: 'entity.name.type', settings: { foreground: '#e5c07b' } },
      { scope: 'storage.type', settings: { foreground: '#c678dd' } },
    ],
  },
}

/**
 * Monokai Theme
 */
const monokai: VSCodeThemePreset = {
  id: 'monokai',
  name: 'Monokai',
  preview: {
    background: '#272822',
    foreground: '#f8f8f2',
    accent: '#a6e22e',
    surface: '#1e1f1c',
  },
  theme: {
    name: 'Monokai',
    type: 'dark',
    colors: {
      'editor.background': '#272822',
      'editor.foreground': '#f8f8f2',
      'sideBar.background': '#1e1f1c',
      'sideBar.foreground': '#f8f8f2',
      'activityBar.background': '#272822',
      'activityBar.foreground': '#f8f8f2',
      'activityBarBadge.background': '#a6e22e',
      'panel.background': '#1e1f1c',
      'panel.border': '#464741',
      'button.background': '#a6e22e',
      'button.foreground': '#272822',
      'input.background': '#1e1f1c',
      'input.foreground': '#f8f8f2',
      'input.border': '#464741',
      'list.activeSelectionBackground': '#49483e',
      'list.hoverBackground': '#3e3d32',
      focusBorder: '#a6e22e',
      'textLink.foreground': '#66d9ef',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#75715e' } },
      { scope: 'string', settings: { foreground: '#e6db74' } },
      { scope: 'constant.numeric', settings: { foreground: '#ae81ff' } },
      { scope: 'keyword', settings: { foreground: '#f92672' } },
      { scope: 'variable', settings: { foreground: '#f8f8f2' } },
      { scope: 'entity.name.function', settings: { foreground: '#a6e22e' } },
      { scope: 'entity.name.type', settings: { foreground: '#66d9ef' } },
      { scope: 'storage.type', settings: { foreground: '#f92672' } },
    ],
  },
}

/**
 * Nord Theme
 * https://www.nordtheme.com/
 */
const nord: VSCodeThemePreset = {
  id: 'nord',
  name: 'Nord',
  preview: {
    background: '#2e3440',
    foreground: '#d8dee9',
    accent: '#88c0d0',
    surface: '#3b4252',
  },
  theme: {
    name: 'Nord',
    type: 'dark',
    colors: {
      'editor.background': '#2e3440',
      'editor.foreground': '#d8dee9',
      'sideBar.background': '#2e3440',
      'sideBar.foreground': '#d8dee9',
      'activityBar.background': '#2e3440',
      'activityBar.foreground': '#d8dee9',
      'activityBarBadge.background': '#88c0d0',
      'panel.background': '#3b4252',
      'panel.border': '#4c566a',
      'button.background': '#88c0d0',
      'button.foreground': '#2e3440',
      'input.background': '#3b4252',
      'input.foreground': '#d8dee9',
      'input.border': '#4c566a',
      'list.activeSelectionBackground': '#3b4252',
      'list.hoverBackground': '#434c5e',
      focusBorder: '#88c0d0',
      'textLink.foreground': '#88c0d0',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#616e88', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#a3be8c' } },
      { scope: 'constant.numeric', settings: { foreground: '#b48ead' } },
      { scope: 'keyword', settings: { foreground: '#81a1c1' } },
      { scope: 'variable', settings: { foreground: '#d8dee9' } },
      { scope: 'entity.name.function', settings: { foreground: '#88c0d0' } },
      { scope: 'entity.name.type', settings: { foreground: '#8fbcbb' } },
      { scope: 'storage.type', settings: { foreground: '#81a1c1' } },
    ],
  },
}

/**
 * Night Owl Theme
 * https://marketplace.visualstudio.com/items?itemName=sdras.night-owl
 */
const nightOwl: VSCodeThemePreset = {
  id: 'night-owl',
  name: 'Night Owl',
  preview: {
    background: '#011627',
    foreground: '#d6deeb',
    accent: '#7fdbca',
    surface: '#0b2942',
  },
  theme: {
    name: 'Night Owl',
    type: 'dark',
    colors: {
      'editor.background': '#011627',
      'editor.foreground': '#d6deeb',
      'sideBar.background': '#011627',
      'sideBar.foreground': '#d6deeb',
      'activityBar.background': '#011627',
      'activityBar.foreground': '#d6deeb',
      'activityBarBadge.background': '#7fdbca',
      'panel.background': '#011627',
      'panel.border': '#5f7e97',
      'button.background': '#7fdbca',
      'button.foreground': '#011627',
      'input.background': '#0b2942',
      'input.foreground': '#d6deeb',
      'input.border': '#5f7e97',
      'list.activeSelectionBackground': '#0b2942',
      'list.hoverBackground': '#1d3b53',
      focusBorder: '#7fdbca',
      'textLink.foreground': '#82aaff',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#637777', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#ecc48d' } },
      { scope: 'constant.numeric', settings: { foreground: '#f78c6c' } },
      { scope: 'keyword', settings: { foreground: '#c792ea' } },
      { scope: 'variable', settings: { foreground: '#d6deeb' } },
      { scope: 'entity.name.function', settings: { foreground: '#82aaff' } },
      { scope: 'entity.name.type', settings: { foreground: '#7fdbca' } },
      { scope: 'storage.type', settings: { foreground: '#c792ea' } },
    ],
  },
}

/**
 * GitHub Dark Theme
 * https://marketplace.visualstudio.com/items?itemName=GitHub.github-vscode-theme
 */
const githubDark: VSCodeThemePreset = {
  id: 'github-dark',
  name: 'GitHub Dark',
  preview: {
    background: '#0d1117',
    foreground: '#c9d1d9',
    accent: '#58a6ff',
    surface: '#161b22',
  },
  theme: {
    name: 'GitHub Dark',
    type: 'dark',
    colors: {
      'editor.background': '#0d1117',
      'editor.foreground': '#c9d1d9',
      'sideBar.background': '#0d1117',
      'sideBar.foreground': '#c9d1d9',
      'activityBar.background': '#0d1117',
      'activityBar.foreground': '#c9d1d9',
      'activityBarBadge.background': '#58a6ff',
      'panel.background': '#161b22',
      'panel.border': '#30363d',
      'button.background': '#238636',
      'button.foreground': '#ffffff',
      'input.background': '#0d1117',
      'input.foreground': '#c9d1d9',
      'input.border': '#30363d',
      'list.activeSelectionBackground': '#161b22',
      'list.hoverBackground': '#161b22',
      focusBorder: '#58a6ff',
      'textLink.foreground': '#58a6ff',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#8b949e', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#a5d6ff' } },
      { scope: 'constant.numeric', settings: { foreground: '#79c0ff' } },
      { scope: 'keyword', settings: { foreground: '#ff7b72' } },
      { scope: 'variable', settings: { foreground: '#c9d1d9' } },
      { scope: 'entity.name.function', settings: { foreground: '#d2a8ff' } },
      { scope: 'entity.name.type', settings: { foreground: '#7ee787' } },
      { scope: 'storage.type', settings: { foreground: '#ff7b72' } },
    ],
  },
}

/**
 * Solarized Dark Theme
 * https://ethanschoonover.com/solarized/
 */
const solarizedDark: VSCodeThemePreset = {
  id: 'solarized-dark',
  name: 'Solarized Dark',
  preview: {
    background: '#002b36',
    foreground: '#839496',
    accent: '#268bd2',
    surface: '#073642',
  },
  theme: {
    name: 'Solarized Dark',
    type: 'dark',
    colors: {
      'editor.background': '#002b36',
      'editor.foreground': '#839496',
      'sideBar.background': '#00212b',
      'sideBar.foreground': '#839496',
      'activityBar.background': '#002b36',
      'activityBar.foreground': '#839496',
      'activityBarBadge.background': '#268bd2',
      'panel.background': '#073642',
      'panel.border': '#094554',
      'button.background': '#268bd2',
      'button.foreground': '#fdf6e3',
      'input.background': '#073642',
      'input.foreground': '#839496',
      'input.border': '#094554',
      'list.activeSelectionBackground': '#094554',
      'list.hoverBackground': '#073642',
      focusBorder: '#268bd2',
      'textLink.foreground': '#268bd2',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#586e75', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#2aa198' } },
      { scope: 'constant.numeric', settings: { foreground: '#d33682' } },
      { scope: 'keyword', settings: { foreground: '#859900' } },
      { scope: 'variable', settings: { foreground: '#839496' } },
      { scope: 'entity.name.function', settings: { foreground: '#268bd2' } },
      { scope: 'entity.name.type', settings: { foreground: '#b58900' } },
      { scope: 'storage.type', settings: { foreground: '#859900' } },
    ],
  },
}

/**
 * Tokyo Night Theme
 * https://marketplace.visualstudio.com/items?itemName=enkia.tokyo-night
 */
const tokyoNight: VSCodeThemePreset = {
  id: 'tokyo-night',
  name: 'Tokyo Night',
  preview: {
    background: '#1a1b26',
    foreground: '#a9b1d6',
    accent: '#7aa2f7',
    surface: '#16161e',
  },
  theme: {
    name: 'Tokyo Night',
    type: 'dark',
    colors: {
      'editor.background': '#1a1b26',
      'editor.foreground': '#a9b1d6',
      'sideBar.background': '#16161e',
      'sideBar.foreground': '#a9b1d6',
      'activityBar.background': '#16161e',
      'activityBar.foreground': '#a9b1d6',
      'activityBarBadge.background': '#7aa2f7',
      'panel.background': '#16161e',
      'panel.border': '#29292e',
      'button.background': '#7aa2f7',
      'button.foreground': '#1a1b26',
      'input.background': '#16161e',
      'input.foreground': '#a9b1d6',
      'input.border': '#29292e',
      'list.activeSelectionBackground': '#29292e',
      'list.hoverBackground': '#1f202e',
      focusBorder: '#7aa2f7',
      'textLink.foreground': '#7aa2f7',
    },
    tokenColors: [
      { scope: 'comment', settings: { foreground: '#565f89', fontStyle: 'italic' } },
      { scope: 'string', settings: { foreground: '#9ece6a' } },
      { scope: 'constant.numeric', settings: { foreground: '#ff9e64' } },
      { scope: 'keyword', settings: { foreground: '#bb9af7' } },
      { scope: 'variable', settings: { foreground: '#c0caf5' } },
      { scope: 'entity.name.function', settings: { foreground: '#7aa2f7' } },
      { scope: 'entity.name.type', settings: { foreground: '#2ac3de' } },
      { scope: 'storage.type', settings: { foreground: '#bb9af7' } },
    ],
  },
}

/**
 * All available VSCode theme presets
 */
export const vscodeThemePresets: VSCodeThemePreset[] = [
  dracula,
  oneDarkPro,
  monokai,
  nord,
  nightOwl,
  githubDark,
  solarizedDark,
  tokyoNight,
]

/**
 * Get a preset by ID
 */
export function getPresetById(id: string): VSCodeThemePreset | undefined {
  return vscodeThemePresets.find((preset) => preset.id === id)
}

/**
 * Export individual presets for direct import
 */
export {
  dracula,
  githubDark,
  monokai,
  nightOwl,
  nord,
  oneDarkPro,
  solarizedDark,
  tokyoNight,
}
