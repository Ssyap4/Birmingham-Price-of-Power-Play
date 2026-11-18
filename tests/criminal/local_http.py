"""Shared loopback HTTP settings for the many-resource mobile acceptance suite."""
from http.server import ThreadingHTTPServer

class LocalServer(ThreadingHTTPServer):
    # Windows and Linux may issue many parallel connections for CSS, script,
    # WebP and fonts. The default backlog of five can refuse valid requests.
    request_queue_size = 128

def tap_mission_pin(page, mission, tap):
    """Exercise the real district pin, then the mission row when grouped."""
    direct=f'.cr-pin[data-mission="{mission}"]'
    if page.locator(direct).count():
        tap(direct)
        return
    district=page.evaluate("(id)=>CriminalContent.catalog().find(m=>m.id===id).districtId",mission)
    tap(f'.cr-pin[data-catalog-district="{district}"]')
    assert page.locator('#crCatalogFilter').input_value()=='district:'+district
    tap(f'.cr-mission-list [data-mission="{mission}"]')
