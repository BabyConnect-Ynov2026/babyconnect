- Pour faire du monitoring et avoir une vue d'ensemble on a mis en place un **Grafana** qui permet de créer des **Dashboards**. 


Dans le ``docker-compose.yml``

```
grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin

```
