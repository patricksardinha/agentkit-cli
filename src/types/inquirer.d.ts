declare module 'inquirer' {
  export interface QuestionBase {
    type: string
    name: string
    message: string
    default?: unknown
    choices?: unknown[]
    validate?: (input: unknown) => boolean | string | Promise<boolean | string>
  }

  export interface ConfirmQuestion extends QuestionBase {
    type: 'confirm'
    default?: boolean
  }

  export interface InputQuestion extends QuestionBase {
    type: 'input'
    default?: string
  }

  export interface ListQuestion extends QuestionBase {
    type: 'list'
    choices: string[]
    default?: string
  }

  export type Question = ConfirmQuestion | InputQuestion | ListQuestion

  export interface Inquirer {
    prompt<T extends Record<string, unknown>>(questions: Question[]): Promise<T>
    createPromptModule(): (questions: Question[]) => Promise<Record<string, unknown>>
  }

  const inquirer: Inquirer
  export default inquirer
}
