#Requires AutoHotkey v2.0
#SingleInstance Force

logPath := A_Args.Length >= 1 ? A_Args[1] : "ahk.log"

; enable click animation ;;;;;;;;;;;
~LButton::{
    MouseGetPos(&x, &y)

    size := 40

    g := Gui("-Caption +AlwaysOnTop +ToolWindow")
    g.BackColor := "Yellow"

    g.Show(Format("x{} y{} w{} h{} NoActivate"
        , x - size//2
        , y - size//2
        , size
        , size))

    hOuter := DllCall("CreateEllipticRgn", "Int", 0, "Int", 0, "Int", size, "Int", size, "Ptr")
    hInner := DllCall("CreateEllipticRgn", "Int", 5, "Int", 5, "Int", size-5, "Int", size-5, "Ptr")

    DllCall("CombineRgn", "Ptr", hOuter, "Ptr", hOuter, "Ptr", hInner, "Int", 3)
    DllCall("SetWindowRgn", "Ptr", g.Hwnd, "Ptr", hOuter, "Int", true)

    SetTimer(() => g.Destroy(), -300)
}



ToolTip("Waiting for the installer window to appear...")
winTitle := "Hermes"
try {
    WinWait(winTitle, , 30)
} catch {
    FileAppend("ERROR: Hermes installer window did not appear within 30s`n", logPath)
    ExitApp(1)
}
ToolTip("Installer window appeared. Sleeping for a few seconds.....")
WinGetPos(&x, &y, &w, &h, winTitle)
FileAppend(Format("Window found at x={1} y={2} w={3} h={4}`n", x, y, w, h), logPath)

Sleep(3000)

ToolTip("Clicking install at ")

; click install
clickX := x + (w / 2)
clickY := y + 418
Click(clickX, clickY)

Sleep(2000)
ToolTip("Done")

; done
ExitApp(0)