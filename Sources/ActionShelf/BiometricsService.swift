import Foundation
import LocalAuthentication

@MainActor
public final class BiometricsService: ObservableObject {
    public enum AuthState: Equatable {
        case idle
        case authenticating
        case authorized
        case rejected(String)
    }

    @Published public var state: AuthState = .idle

    public init() {}

    public func authenticate(reason: String) async -> Bool {
        let context = LAContext()
        context.localizedCancelTitle = "Cancelar"
        var error: NSError?

        guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
            let msg = error?.localizedDescription ?? "Dispositivo sem suporte a autenticação."
            self.state = .rejected(msg)
            return false
        }

        self.state = .authenticating

        do {
            let success = try await context.evaluatePolicy(
                .deviceOwnerAuthentication,
                localizedReason: reason
            )
            if success {
                self.state = .authorized
                return true
            } else {
                self.state = .rejected("Não autorizado.")
                return false
            }
        } catch {
            self.state = .rejected(error.localizedDescription)
            return false
        }
    }
}
