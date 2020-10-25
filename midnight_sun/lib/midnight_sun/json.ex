Application.ensure_all_started(:timex)

defmodule Cities do
  def load do
    File.read!("../data.json")
    |> Jason.decode!()
    |> Enum.map(fn x ->
      sunsetTime = Solar.event(:set, {x["lat"], x["lon"]}, timezone: "UTC")

      Map.put(x, "sunsetTime", sunsetTime)
    end)
    |> Enum.filter(fn x -> elem(x["sunsetTime"], 0) != :error end)
  end

  def sunsets do
    load()
    |> Enum.filter(fn x ->
      {:ok, sunsetTime} = x["sunsetTime"]
      timeLeft = Time.diff(sunsetTime, Time.utc_now())

      0 < timeLeft && timeLeft < 10 * 60
    end)

    # |> Enum.sort(fn a, b ->
    #   Time.compare(elem(Map.get(a, "sunsetTime"), 1), elem(Map.get(b, "sunsetTime"), 1))
    # end)
  end

  def urls do
    sunsets()
    |> Enum.sort(fn a, b -> a["pop"] > b["pop"] end)
    |> Enum.map(fn city ->
      "https://www.youtube.com/results?search_query=#{city["n"]}, #{city["c"]}&sp=EgJAAQ%253D%253D"
    end)
    |> Enum.map(fn x -> String.replace(x, " ", "%20") end)
    |> Enum.join("\n")
    |> IO.puts()
  end

  #
end
