package com.workshop.order.service;

import com.workshop.order.entity.Order;
import com.workshop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.Optional;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    // CREATE OR UPDATE ORDER
    public Order saveOrder(Order order) {

        if (order.getId() == null) {
            // NEW ORDER → generate number
            order.setOrderNumber(generateOrderNumber());
        } else {
            // EXISTING ORDER → preserve order number
            Order existing = repository.findById(order.getId())
                    .orElseThrow(() -> new RuntimeException("Order not found"));
            order.setOrderNumber(existing.getOrderNumber());
        }

        // attach parts to order
        if (order.getParts() != null) {
            order.getParts().forEach(p -> p.setOrder(order));
        }

        return repository.save(order);
    }

    // SEARCH ORDER
    public Optional<Order> searchOrder(String orderNumber, String license) {

        if (orderNumber != null && !orderNumber.isEmpty()) {
            return repository.findByOrderNumber(orderNumber);
        }

        if (license != null && !license.isEmpty()) {
            return repository.findByLicense(license);
        }

        return Optional.empty();
    }

    // CREATE NEW ORDER (NO DB INSERT)
    public Order createNewOrder() {
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        return order;
    }

    // ORDER NUMBER GENERATOR
    private String generateOrderNumber() {
        long count = repository.count() + 1;
        int year = Year.now().getValue();
        return "ORD-" + year + "-" + String.format("%04d", count);
    }
}
