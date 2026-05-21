const fs = require('fs')
const path = require('path')
const { Resvg } = require('@resvg/resvg-js')

const PROJECT_ROOT = path.resolve(__dirname, '..')
const ICON_SOURCE_DIR = path.join(PROJECT_ROOT, 'node_modules', 'lucide-static', 'icons')
const ICON_OUTPUT_DIR = path.join(PROJECT_ROOT, 'miniprogram', 'assets', 'icons', 'lucide')

const BASE_STYLE = 'stroke-linecap="round" stroke-linejoin="round" fill="none" stroke-width="2"'
const VIEW_BOX = '0 0 24 24'
const CANVAS_SIZE = 96

const ICON_SET = [
  {
    name: 'house',
    variants: {
      active: '#8B4513',
      inactive: '#8D6E63'
    }
  },
  {
    name: 'calendar-range',
    variants: {
      active: '#8B4513',
      inactive: '#8D6E63'
    }
  },
  {
    name: 'circle-user-round',
    variants: {
      active: '#8B4513',
      inactive: '#8D6E63'
    }
  },
  {
    name: 'images',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'image-plus',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'baby',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'users-round',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'trash-2',
    variants: {
      active: '#C62828',
      inactive: '#B0835F'
    }
  },
  {
    name: 'message-square-heart',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'badge-plus',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'user-round-pen',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'shield-check',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'map-pinned',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'text',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'clock-3',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'download',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  },
  {
    name: 'user-round-check',
    variants: {
      active: '#8B4513',
      inactive: '#B0835F'
    }
  }
]

function ensureDir(targetDir) {
  fs.mkdirSync(targetDir, { recursive: true })
}

function loadSvg(iconName) {
  const targetPath = path.join(ICON_SOURCE_DIR, iconName + '.svg')

  if (!fs.existsSync(targetPath)) {
    throw new Error('Missing lucide icon: ' + iconName)
  }

  return fs.readFileSync(targetPath, 'utf8')
}

function colorizeSvg(svg, color) {
  const normalized = svg
    .replace(/width="24"/g, 'width="' + CANVAS_SIZE + '"')
    .replace(/height="24"/g, 'height="' + CANVAS_SIZE + '"')
    .replace(/stroke="currentColor"/g, 'stroke="' + color + '"')

  if (normalized.includes('stroke="' + color + '"')) {
    return normalized
  }

  return normalized.replace('<svg', '<svg stroke="' + color + '" ' + BASE_STYLE)
}

function renderPng(svg) {
  const resvg = new Resvg(svg, {
    fitTo: {
      mode: 'width',
      value: CANVAS_SIZE
    }
  })

  return resvg.render().asPng()
}

function writeIcon(iconName, variantName, color) {
  const svg = loadSvg(iconName)
  const coloredSvg = colorizeSvg(svg, color)
  const png = renderPng(coloredSvg)
  const targetPath = path.join(ICON_OUTPUT_DIR, iconName + '-' + variantName + '.png')

  fs.writeFileSync(targetPath, png)
  return targetPath
}

function main() {
  ensureDir(ICON_OUTPUT_DIR)

  const manifest = []

  ICON_SET.forEach((icon) => {
    Object.entries(icon.variants).forEach(([variantName, color]) => {
      const outputPath = writeIcon(icon.name, variantName, color)
      manifest.push({
        icon: icon.name,
        variant: variantName,
        color,
        output: path.relative(PROJECT_ROOT, outputPath)
      })
    })
  })

  const manifestPath = path.join(ICON_OUTPUT_DIR, 'manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n')
  console.log('Generated', manifest.length, 'png icons into', path.relative(PROJECT_ROOT, ICON_OUTPUT_DIR))
}

main()
