import { requireSession } from '../server/context'
import { TModalResult, TMsgDlgType } from './types'

/**
 * Shows a message box on the current session's client. Resolves once the user
 * dismisses it, so `await ShowMessage(...)` blocks just like in Delphi.
 */
export async function ShowMessage(text: string): Promise<void> {
  await MessageDlg(text, TMsgDlgType.Information, [TModalResult.Ok])
}

/**
 * Asks the user a question and resolves with the button they chose:
 *
 * ```ts
 * if (await MessageDlg('Delete?', TMsgDlgType.Confirmation, [TModalResult.Yes, TModalResult.No]) === TModalResult.Yes)
 * ```
 */
export async function MessageDlg(
  text: string,
  type: TMsgDlgType = TMsgDlgType.Information,
  buttons: TModalResult[] = [TModalResult.Ok],
  title?: string,
): Promise<TModalResult> {
  const session = requireSession()
  const answer = await session.dialog({
    kind: type,
    title: title ?? session.application.title,
    text,
    buttons,
  })
  return (buttons as string[]).includes(answer) ? answer as TModalResult : TModalResult.Cancel
}
