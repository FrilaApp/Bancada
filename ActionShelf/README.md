# ActionShelf — Laboratório de Notch UI & Biometria

Mini-aplicativo nativo em **SwiftUI e AppKit** para macOS, projetado para viver ancorado na Notch do MacBook com física de molas e autenticação biométrica (Touch ID).

## Como Executar

### 1. Compilação Rápida
```bash
./build.sh
```

### 2. Teste Visual (Modo Simulação)
Executa a animação de estiramento da Notch (`notch stretch`), exibe o feedback luminoso e se retrai sem travar no Touch ID:
```bash
./ActionShelf --test
```

### 3. Execução Real com Biometria
Abre a Action Shelf ancorada na Notch e solicita autenticação:
```bash
./ActionShelf --reason "Autorizar o envio de alterações no Challenge 18"
```

## Arquitetura

- **`ActionShelfView.swift`**: Interface SwiftUI com container em **Liquid Glass** nativo (`.glassEffect`, `GlassEffectContainer`), suporte a cantos contínuos, iluminação direcional (*spotlight glow*), badge interativo e ciclo de estados (`authenticating`, `authorized`, `rejected`).
- **`MotionTokens.swift`**: Tokens declarativos de física de molas (`Theme.notchStretch`, `Theme.punchPulse`, `Theme.contentSpring`, etc.) e paleta de tintings translúcidos de vidro.
- **`NotchGeometry.swift`**: Detecção automática de telas com entalhe físico (`safeAreaInsets.top`).
- **`BiometricsService.swift`**: Serviço assíncrono com `LocalAuthentication`.
- **`main.swift`**: Ponto de entrada que inicializa a janela flutuante `NSPanel` de nível de status sem poluir o Dock (`LSUIElement = 1`).
