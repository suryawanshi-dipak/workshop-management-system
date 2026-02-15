package com.workshop.order.service;

import com.workshop.order.dto.CreateOrderRequest;
import com.workshop.order.dto.OrderPartRequest;
import com.workshop.order.entity.Order;
import com.workshop.order.entity.OrderPart;
import com.workshop.order.repository.OrderRepository;
import org.springframework.stereotype.Service;

import java.time.Year;
import java.util.ArrayList;
import java.util.List;
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

    public Order createOrderFromPlanning(CreateOrderRequest request) {
        
        Order ord = new Order();
        ord.setOrderNumber(generateOrderNumber());
        ord.setLicense(request.getLicense());
        ord.setCustomerName(request.getCustomerName());
        ord.setCustomerNumber(request.getCustomerNumber());
        ord.setCarMileage(request.getCarMileage());
        ord.setCarMake(request.getCarMake());

        // handle parts
        if (request.getParts() != null) {
            List<OrderPart> parts = new ArrayList<>();
            for (OrderPartRequest p : request.getParts()) {
                OrderPart part = new OrderPart();
                part.setPartNo(p.getPartNo());
                part.setDescription(p.getDescription());
                part.setQuantity(p.getQuantity());
                part.setPrice(p.getPrice());
                part.setOrder(ord);
                parts.add(part);
            }
            ord.setParts(parts);
        }

        ord = repository.save(ord);
        return ord;
    }
}
