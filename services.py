from functools import reduce

def procesar_colores_funcional(color_principal: int, adicionales_str: str) -> list:
    """
    Toma el color principal y el string de adicionales, los normaliza,
    filtra repetidos y limita a un máximo de 3 colores en total.
    """
    tokens = list(filter(None, adicionales_str.split(",")))
    adicionales = list(map(int, tokens))
    
    # Combinar usando reduce asegurando unicidad funcional
    colores_totales = reduce(
        lambda acc, x: acc if x in acc or len(acc) >= 3 else acc + [x],
        adicionales,
        [color_principal]
    )
    return colores_totales