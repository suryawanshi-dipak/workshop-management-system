package com.workshop.planning.service;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.workshop.planning.client.OrderClient;
import com.workshop.planning.config.RestConfig;
import com.workshop.planning.dto.CreateOrderRequestDTO;
import com.workshop.planning.dto.CreateOrderResponseDTO;
import com.workshop.planning.dto.OrderPartResuestDTO;
import com.workshop.planning.entity.Planning;
import com.workshop.planning.entity.PlanningLine;
import com.workshop.planning.repository.PlanningRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.timelimiter.annotation.TimeLimiter;

@Service
public class PlanningService {
    
    private final PlanningRepository planningRepository;
    private final RestTemplate restTemplate;
    private final OrderClient orderClient;

    public PlanningService(PlanningRepository planningRepository, RestTemplate restTemplate, OrderClient orderClient) {
        this.planningRepository = planningRepository;
        this.restTemplate = restTemplate;
        this.orderClient = orderClient;
    }

    public Planning createPlanning(Planning planning) {
        if (planning.getLines() != null) {
            for (PlanningLine line : planning.getLines()) {
                line.setPlanning(planning);
            }
        }
        planning.setStatus("DRAFT");
        return planningRepository.save(planning);
    }

    public Planning getPlanning(Long id) {
        Planning p = planningRepository.getById(id);
        return p;
    }

    @CircuitBreaker(name = "order-service", fallbackMethod = "orderFallback")
    @TimeLimiter(name = "orderService")
    public CompletableFuture<CreateOrderResponseDTO> createOrderFromPlanning(Long id) {

        Planning planning = getPlanning(id);
        System.out.println("createOrderFromPlanning " + planning.toString());        
        CreateOrderRequestDTO request = new CreateOrderRequestDTO();

        request.setPlanningId(planning.getId());
        request.setLicense(planning.getLicense());
        request.setCustomerName(planning.getCustomerName());
        request.setCustomerNumber(planning.getCustomerNumber());
        request.setCarMileage(planning.getCarMileage());
        request.setCarMake(planning.getCarMake());

        List<OrderPartResuestDTO> parts = new ArrayList<>();

        for (PlanningLine line : planning.getLines()) {
            OrderPartResuestDTO part = new OrderPartResuestDTO();
            part.setPartNo(line.getItemCode());
            part.setDescription(line.getDescription());
            part.setQuantity(line.getQuantity());
            part.setPrice(line.getPrice());
            parts.add(part);
        }

        request.setParts(parts);    
        
        // 2️⃣ Call Order Service
        // String url = "http://ORDER-SERVICE/api/orders/from-planning";
        // CreateOrderResponseDTO response = restTemplate.postForObject(url, request, CreateOrderResponseDTO.class);
        CreateOrderResponseDTO response = orderClient.createOrder(request);
        
        // Save order no in planning
        planning.setOrderId(response.getOrderId());
        planning.setStatus("Order Created"); 

        return CompletableFuture.completedFuture(response);
    }

    public CompletableFuture<CreateOrderResponseDTO> orderFallback(Long id, Exception ex) {

        System.out.println("Circuit Breaker activated: " + ex.getMessage());

        CreateOrderResponseDTO fallback = new CreateOrderResponseDTO();
        fallback.setOrderId(null);
        return CompletableFuture.completedFuture(fallback);
    }

}
