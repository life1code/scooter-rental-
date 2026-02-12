#!/bin/bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
echo "Jenkins permissions fixed!"
