import SwiftUI

public enum Theme {
    // Física de molas calibradas (response e dampingFraction) conforme as diretrizes do laboratório
    public static let notchStretch = Animation.spring(response: 0.38, dampingFraction: 0.72)
    public static let notchRetract = Animation.spring(response: 0.28, dampingFraction: 0.85)
    public static let morphSettle  = Animation.spring(response: 0.24, dampingFraction: 0.76)
    public static let punchPulse   = Animation.spring(response: 0.18, dampingFraction: 0.55)
    public static let shakeDamped  = Animation.spring(response: 0.12, dampingFraction: 0.30)
    public static let contentSpring = Animation.spring(response: 0.28, dampingFraction: 0.78)

    // Cores e iluminação direcional
    public static let bezelBlack   = Color.black
    public static let glassFill    = Color(white: 0.07, opacity: 0.96)
    public static let borderGlow   = Color.cyan.opacity(0.60)
    public static let successGlow  = Color(red: 0.20, green: 0.85, blue: 0.45)
    public static let alertGlow    = Color(red: 0.95, green: 0.25, blue: 0.30)

    // Tintings translúcidos nativos para Liquid Glass (iOS 26+ / macOS 26+)
    public static let glassCyan    = Color.cyan.opacity(0.12)
    public static let glassSuccess = Color(red: 0.20, green: 0.85, blue: 0.45).opacity(0.18)
    public static let glassAlert   = Color(red: 0.95, green: 0.25, blue: 0.30).opacity(0.18)
}
