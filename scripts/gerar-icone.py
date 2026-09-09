#!/usr/bin/env python3
"""Gera o ícone da Bancada (AppIcon.icns) a partir dos tokens de cor do app.

Desenha tudo com Pillow em vez de importar uma arte pronta: assim o ícone
sai versionado como código (este script), reproduzível, e alinhado à
paleta de `tokens.json` sem depender de um arquivo binário editado à mão
em outra ferramenta.

Uso: python3 scripts/gerar-icone.py
Saída: scripts/AppIcon.icns
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

RAIZ = Path(__file__).resolve().parent.parent
TOKENS = json.loads((RAIZ / "tokens.json").read_text())["cor"]

# Paleta "escura" da Bancada — o mesmo tema que a janela usa por padrão.
FUNDO_TOPO = "#242119"
FUNDO_BASE = TOKENS["fundo"]["escuro"]        # #141310
PAGINA = TOKENS["texto"]["escuro"]            # #F2F0EA
LINHA_TEXTO = TOKENS["textoSutil"]["escuro"]  # #9C978A
ACENTO = TOKENS["acento"]["escuro"]           # #E08A5C

TAMANHO = 1024
SS = 4  # supersample: desenha em 4x e reduz no final, pelas bordas lisas


def _squircle_mask(tamanho: int, raio: int) -> Image.Image:
    mascara = Image.new("L", (tamanho, tamanho), 0)
    desenho = ImageDraw.Draw(mascara)
    desenho.rounded_rectangle([0, 0, tamanho - 1, tamanho - 1], radius=raio, fill=255)
    return mascara


def _gradiente_vertical(tamanho: int, topo: str, base: str) -> Image.Image:
    img = Image.new("RGB", (1, tamanho), topo)
    desenho = ImageDraw.Draw(img)
    r1, g1, b1 = Image.new("RGB", (1, 1), topo).getpixel((0, 0))
    r2, g2, b2 = Image.new("RGB", (1, 1), base).getpixel((0, 0))
    for y in range(tamanho):
        t = y / (tamanho - 1)
        cor = (
            round(r1 + (r2 - r1) * t),
            round(g1 + (g2 - g1) * t),
            round(b1 + (b2 - b1) * t),
        )
        desenho.point((0, y), fill=cor)
    return img.resize((tamanho, tamanho))


def gerar() -> Image.Image:
    n = TAMANHO * SS
    canvas = Image.new("RGBA", (n, n), (0, 0, 0, 0))

    # Fundo: quadrado arredondado (squircle aproximado) com degradê quente,
    # igual à sensação de "papel sob luz baixa" do tema escuro do app.
    raio_fundo = int(n * 0.225)
    fundo = _gradiente_vertical(n, FUNDO_TOPO, FUNDO_BASE).convert("RGBA")
    fundo.putalpha(_squircle_mask(n, raio_fundo))
    canvas.alpha_composite(fundo)

    # Brilho suave no canto superior esquerdo, para não ficar chapado.
    # Um único elipse desfocado em vez de vários círculos concêntricos —
    # anéis sólidos geram banding visível no degradê.
    brilho = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    dbrilho = ImageDraw.Draw(brilho)
    cx, cy = int(n * 0.32), int(n * 0.2)
    raio = int(n * 0.5)
    dbrilho.ellipse([cx - raio, cy - raio, cx + raio, cy + raio], fill=(255, 250, 240, 40))
    brilho = brilho.filter(ImageFilter.GaussianBlur(n * 0.12))
    mascara_brilho = Image.composite(brilho.split()[3], Image.new("L", (n, n), 0), _squircle_mask(n, raio_fundo))
    brilho.putalpha(mascara_brilho)
    canvas.alpha_composite(brilho)

    # Glifo: uma página com a quina dobrada, referência direta ao que a
    # Bancada faz — ler as notas do vault. Simples o bastante para
    # continuar legível em 16x16.
    desenho = ImageDraw.Draw(canvas)

    larg_pag, alt_pag = int(n * 0.46), int(n * 0.58)
    px = (n - larg_pag) // 2
    py = (n - alt_pag) // 2 + int(n * 0.015)
    dobra = int(larg_pag * 0.32)
    raio_pag = int(n * 0.045)

    # Sombra de contato suave sob a página.
    sombra = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    dsombra = ImageDraw.Draw(sombra)
    off = int(n * 0.02)
    dsombra.rounded_rectangle(
        [px + off, py + off * 2, px + larg_pag + off, py + alt_pag + off * 2],
        radius=raio_pag,
        fill=(0, 0, 0, 70),
    )
    sombra = sombra.filter(ImageFilter.GaussianBlur(n * 0.02))
    canvas.alpha_composite(sombra)

    # Corpo da página.
    pagina_shape = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    dpagina = ImageDraw.Draw(pagina_shape)
    dpagina.rounded_rectangle(
        [px, py, px + larg_pag, py + alt_pag], radius=raio_pag, fill=PAGINA
    )
    # Corta o triângulo da quina dobrada (canto superior direito).
    dpagina.polygon(
        [
            (px + larg_pag - dobra, py),
            (px + larg_pag, py),
            (px + larg_pag, py + dobra),
        ],
        fill=(0, 0, 0, 0),
    )
    canvas.alpha_composite(pagina_shape)

    # Dobra em si, na cor de acento, com leve sombra por baixo.
    dobra_shape = Image.new("RGBA", (n, n), (0, 0, 0, 0))
    ddobra = ImageDraw.Draw(dobra_shape)
    ddobra.polygon(
        [
            (px + larg_pag - dobra, py),
            (px + larg_pag, py + dobra),
            (px + larg_pag - dobra, py + dobra),
        ],
        fill=ACENTO,
    )
    canvas.alpha_composite(dobra_shape)

    # Linhas de texto, para lembrar uma nota/registro sem virar ruído.
    linhas = ImageDraw.Draw(canvas)
    margem_x = px + int(larg_pag * 0.16)
    largura_linha = int(larg_pag * 0.68)
    espessura = max(int(n * 0.012), 4)
    y0 = py + int(alt_pag * 0.42)
    passo = int(alt_pag * 0.12)
    for i, fator in enumerate([1.0, 1.0, 0.62]):
        y = y0 + i * passo
        linhas.rounded_rectangle(
            [margem_x, y, margem_x + int(largura_linha * fator), y + espessura],
            radius=espessura // 2,
            fill=LINHA_TEXTO,
        )

    return canvas.resize((TAMANHO, TAMANHO), Image.LANCZOS)


def exportar_iconset(imagem: Image.Image, destino: Path) -> None:
    iconset = destino.with_suffix(".iconset")
    if iconset.exists():
        shutil.rmtree(iconset)
    iconset.mkdir()

    tamanhos = [16, 32, 64, 128, 256, 512, 1024]
    for tam in tamanhos:
        imagem.resize((tam, tam), Image.LANCZOS).save(iconset / f"icon_{tam}x{tam}.png")
        if tam <= 512:
            imagem.resize((tam * 2, tam * 2), Image.LANCZOS).save(iconset / f"icon_{tam}x{tam}@2x.png")

    subprocess.run(["iconutil", "-c", "icns", str(iconset), "-o", str(destino)], check=True)
    shutil.rmtree(iconset)


if __name__ == "__main__":
    icone = gerar()
    icone.save(RAIZ / "scripts" / "AppIcon-preview.png")
    exportar_iconset(icone, RAIZ / "scripts" / "AppIcon.icns")
    print("✓ scripts/AppIcon.icns gerado (e scripts/AppIcon-preview.png para conferir).")
