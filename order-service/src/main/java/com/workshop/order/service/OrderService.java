package com.workshop.order.service;

import com.workshop.order.entity.Order;
import com.workshop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

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
}
