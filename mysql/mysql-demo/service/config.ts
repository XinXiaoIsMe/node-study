import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import yaml from 'js-yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const CONFIG_PATH = path.resolve(__dirname, '../db.config.yaml')

export interface DbConfig {
  host: string
  port: number
  user: string
  password: string
  database: string
}

interface AppConfig {
  db: DbConfig
}

const loadConfig = (): AppConfig => {
  const raw = fs.readFileSync(CONFIG_PATH, 'utf8')
  const parsed = yaml.load(raw) as AppConfig | undefined
  if (!parsed?.db) {
    throw new Error('Invalid configuration: missing db section')
  }
  return parsed
}

export const appConfig = loadConfig()
