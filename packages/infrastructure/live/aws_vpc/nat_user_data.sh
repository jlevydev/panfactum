#!/bin/bash
echo "eni_id=${nat_interface}" >> /etc/fck-nat.conf
service fck-nat restart
