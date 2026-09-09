import AppKit

public struct NotchDimensions {
    public let notchWidth: CGFloat
    public let notchHeight: CGFloat
    public let hasHardwareNotch: Bool
    public let screenFrame: NSRect
}

public enum NotchDetector {
    public static func current() -> NotchDimensions {
        guard let screen = NSScreen.main else {
            return NotchDimensions(
                notchWidth: 216,
                notchHeight: 34,
                hasHardwareNotch: false,
                screenFrame: NSRect(x: 0, y: 0, width: 1440, height: 900)
            )
        }

        let safeInsets = screen.safeAreaInsets
        let hasNotch = safeInsets.top > 0

        var height: CGFloat = hasNotch ? safeInsets.top : 34
        var width: CGFloat = hasNotch ? 216 : 200

        if hasNotch, let left = screen.auxiliaryTopLeftArea, let right = screen.auxiliaryTopRightArea {
            let detectedWidth = right.minX - left.maxX
            if detectedWidth > 100 {
                width = detectedWidth
            }
            height = safeInsets.top
        }

        return NotchDimensions(
            notchWidth: width,
            notchHeight: height,
            hasHardwareNotch: hasNotch,
            screenFrame: screen.frame
        )
    }
}
