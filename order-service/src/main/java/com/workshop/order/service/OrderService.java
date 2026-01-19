package com.workshop.order.service;

import com.workshop.order.entity.Order;
import com.workshop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public Order saveOrder(Order order) {
        if (order.getParts() != null) {
            order.getParts().forEach(part -> part.setOrder(order));
        }
        return repository.save(order);
    }

    public Optional<Order> searchOrder(String orderNumber, String license) {

        if (orderNumber != null && !orderNumber.isEmpty()) {
            return repository.findByOrderNumber(orderNumber);
        }

        if (license != null && !license.isEmpty()) {
            return repository.findByLicense(license);
        }

        return Optional.empty();
    }
}
