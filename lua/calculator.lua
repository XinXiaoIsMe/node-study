function calculator (operator, n1, n2)
  if operator == '+' then
    return n1 + n2
  elseif operator == '-' then
    return n1 - n2
  elseif operator == '*' then
    return n1 * n2
  elseif n2 == 0 then
    print('error')
    return nil
  else
    return n1 / n2
  end
end

return calculator