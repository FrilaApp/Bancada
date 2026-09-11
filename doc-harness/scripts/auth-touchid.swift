import Foundation
import LocalAuthentication

let context = LAContext()
context.localizedCancelTitle = "Cancelar"
var error: NSError?

// .deviceOwnerAuthentication permite Touch ID, Apple Watch ou senha do sistema macOS
guard context.canEvaluatePolicy(.deviceOwnerAuthentication, error: &error) else {
    fputs("⚠ Autenticação do macOS não disponível: \(error?.localizedDescription ?? "desconhecido")\n", stderr)
    exit(1)
}

let semaforo = DispatchSemaphore(value: 0)
var autenticado = false

context.evaluatePolicy(
    .deviceOwnerAuthentication,
    localizedReason: "Autorizar o envio de alterações (git push) no Challenge 18"
) { sucesso, erroAuth in
    autenticado = sucesso
    if let erroAuth = erroAuth, !sucesso {
        fputs("Falha na autenticação: \(erroAuth.localizedDescription)\n", stderr)
    }
    semaforo.signal()
}

semaforo.wait()
exit(autenticado ? 0 : 1)
